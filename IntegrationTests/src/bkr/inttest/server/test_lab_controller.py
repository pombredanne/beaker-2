
import unittest
import xmltramp
import pkg_resources
from turbogears.database import session
from bkr.server.model import TaskStatus, RecipeSet, LabController
from bkr.server.jobxml import XmlJob
from bkr.server.bexceptions import BX
from bkr.inttest import data_setup
from bkr.server.tools import beakerd

class TestLabController(unittest.TestCase):

    def setUp(self):
        from bkr.server.jobs import Jobs
        self.lc_fqdn = u'lab.domain.com'
        lc = data_setup.create_labcontroller(fqdn=self.lc_fqdn)
        user = data_setup.create_user()
        system = data_setup.create_system(owner=user, lab_controller=lc)
        distro = data_setup.create_distro()
        xmljob = XmlJob(xmltramp.parse('''
            <job>
                <whiteboard>job with invalid hostRequires</whiteboard>
                <recipeSet>
                    <recipe>
                        <distroRequires>
                            <distro_name op="=" value="%s" />
                            <distrolabcontroller op="=" value="%s" />
                        </distroRequires>
                        <hostRequires>
                            <hostname op="=" value="%s"/>
                        </hostRequires>
                        <task name="/distribution/install" role="STANDALONE">
                            <params/>
                        </task>
                    </recipe>
                </recipeSet>
            </job>
                 ''' % (distro.name, self.lc_fqdn, system.fqdn)))
        controller = Jobs()
        data_setup.create_task(name=u'/distribution/install')
        session.flush()
        self.job = controller.process_xmljob(xmljob, user)
        session.flush()
        beakerd.new_recipes()
        beakerd.processed_recipesets()
        

    def test_disable_lab_controller(self):
        LabController.by_name(self.lc_fqdn).disabled = True
        session.flush()
        beakerd.queued_recipes()
        recipeset = RecipeSet.by_id(self.job.recipesets[0].id)
        self.assert_(recipeset.status < TaskStatus.by_name(u'Scheduled'))

    def test_enable_lab_controller(self):
        LabController.by_name(self.lc_fqdn).disabled = False
        session.flush()
        beakerd.queued_recipes()
        recipeset = RecipeSet.by_id(self.job.recipesets[0].id)
        self.assertEquals(recipeset.status, TaskStatus.by_name(u'Scheduled'))

